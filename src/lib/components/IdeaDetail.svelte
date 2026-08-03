<script>
  import { createEventDispatcher } from "svelte";
  import SparkIcon from "./SparkIcon.svelte";
  import Icon from "./Icon.svelte";
  import { ideas, STATUS_LABELS } from "../stores/ideas.js";
  import { updateIdeaInDb, deleteIdeaFromDb } from "../stores/persistence.js";
  import { refineIdea, checkOllamaStatus } from "../services/ollama.js";

  export let idea;

  const dispatch = createEventDispatcher();

  const STATUSES = ["idea", "refining", "ready", "building", "dev", "paused", "done", "archived"];

  const STATUS_COLORS = {
    idea: { bg: "rgba(255,255,255,0.05)", color: "var(--text-muted)", dot: "var(--text-ghost)" },
    refining: { bg: "rgba(139,92,246,0.1)", color: "var(--purple-200)", dot: "var(--purple-400)" },
    ready: { bg: "rgba(246,92,244,0.1)", color: "var(--pink-200)", dot: "var(--pink-400)" },
    building: { bg: "rgba(139,92,246,0.12)", color: "var(--purple-200)", dot: "var(--purple-500)" },
    dev: { bg: "rgba(139,92,246,0.12)", color: "var(--purple-200)", dot: "var(--purple-500)" },
    paused: { bg: "rgba(251,191,36,0.1)", color: "var(--warning)", dot: "var(--warning)" },
    done: { bg: "rgba(52,211,153,0.1)", color: "var(--success)", dot: "var(--success)" },
    archived: { bg: "rgba(255,255,255,0.03)", color: "var(--text-ghost)", dot: "var(--text-ghost)" },
  };

  const CATEGORY_ICONS = {
    projeto: "code",
    livro: "book",
    design: "pen-tool",
    estudo: "compass",
    geral: "lightbulb",
  };

  let editing = false;
  let editTitle = "";
  let editSummary = "";
  let editCategory = "";
  let editTags = "";
  let editStack = "";
  let editRawText = "";
  let saving = false;
  let showStatusMenu = false;
  let showRefine = false;

  // refinement
  let refineText = "";
  let isRefining = false;
  let refineHistory = [];
  let refineInputEl;

  // export
  let showExportMenu = false;

  $: statusStyle = STATUS_COLORS[idea.status] || STATUS_COLORS.idea;
  $: statusLabel = STATUS_LABELS[idea.status] || idea.status;
  $: categoryIcon = CATEGORY_ICONS[idea.category] || "lightbulb";
  $: categoryLabel = idea.category ? idea.category.charAt(0).toUpperCase() + idea.category.slice(1) : "Geral";

  function startEdit() {
    editTitle = idea.title || "";
    editSummary = idea.summary || "";
    editCategory = idea.category || "geral";
    editTags = (idea.tags || []).join(", ");
    editStack = (idea.suggestedStack || []).join(", ");
    editRawText = idea.rawText || "";
    editing = true;
    showRefine = false;
  }

  function cancelEdit() { editing = false; }

  async function saveEdit() {
    saving = true;
    const changes = {
      title: editTitle.trim(),
      summary: editSummary.trim(),
      category: editCategory,
      rawText: editRawText.trim(),
      tags: editTags.split(",").map((t) => t.trim()).filter(Boolean),
      suggestedStack: editStack.split(",").map((t) => t.trim()).filter(Boolean),
    };
    ideas.updateIdea(idea.id, changes);
    await updateIdeaInDb(idea.id, changes);
    idea = { ...idea, ...changes, updatedAt: new Date().toISOString() };
    editing = false;
    saving = false;
  }

  function setStatus(newStatus) {
    ideas.updateIdea(idea.id, { status: newStatus });
    updateIdeaInDb(idea.id, { status: newStatus });
    idea = { ...idea, status: newStatus };
    showStatusMenu = false;
  }

  async function handleDelete() {
  if (confirm("Remover esta spark?")) {
    ideas.remove(idea.id);
    await deleteIdeaFromDb(idea.id);
    dispatch("close");
  }
}

  // ── refinement ──
  function handleQuestionClick(q) {
    refineText = q;
    showRefine = true;
    setTimeout(() => refineInputEl?.focus(), 0);
  }

  async function handleRefine() {
    if (!refineText.trim() || isRefining) return;
    const text = refineText.trim();
    refineText = "";
    if (refineInputEl) refineInputEl.style.height = "auto";
    isRefining = true;

    refineHistory = [...refineHistory, { type: "user", text, ts: new Date() }];

    const online = await checkOllamaStatus();
    if (!online) {
      refineHistory = [...refineHistory, { type: "system", text: "Ollama offline. Ligue o Ollama e tente novamente.", ts: new Date() }];
      isRefining = false;
      return;
    }

    try {
      const result = await refineIdea(idea, text);
      if (result) {
        const changes = {
          title: result.title || idea.title,
          summary: result.summary || idea.summary,
          tags: result.tags || idea.tags,
          suggestedStack: result.suggestedStack || idea.suggestedStack,
          questions: result.questions || [],
        };
        ideas.updateIdea(idea.id, changes);
        await updateIdeaInDb(idea.id, changes);
        idea = { ...idea, ...changes, updatedAt: new Date().toISOString() };

        refineHistory = [...refineHistory, {
          type: "spark",
          text: `Spark atualizada: "${changes.title}"`,
          summary: changes.summary,
          ts: new Date(),
        }];
      } else {
        refineHistory = [...refineHistory, { type: "system", text: "Nao consegui processar. Tente reformular.", ts: new Date() }];
      }
    } catch (err) {
      refineHistory = [...refineHistory, { type: "system", text: "Erro: " + err.message, ts: new Date() }];
    }

    isRefining = false;
    scrollRefineToBottom();
  }

  function handleRefineKeydown(e) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleRefine();
  }

  function autoResizeRefine(e) {
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }

  function scrollRefineToBottom() {
    setTimeout(() => {
      const el = document.querySelector(".refine-messages");
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  }

  $: if (refineHistory.length) scrollRefineToBottom();

  // ── export ──
  function exportAs(format) {
    showExportMenu = false;
    let blob, filename;

    if (format === "md") {
      const lines = [
        `# ${idea.title}`,
        "",
        idea.summary,
        "",
        `**Status:** ${statusLabel}`,
        `**Categoria:** ${categoryLabel}`,
      ];
      if (idea.tags?.length) lines.push(`**Tags:** ${idea.tags.join(", ")}`);
      if (idea.suggestedStack?.length) lines.push(`**Stack:** ${idea.suggestedStack.join(", ")}`);
      lines.push("", "## Ideia original", "", idea.rawText || "");
      if (idea.questions?.length) {
        lines.push("", "## Perguntas para refinar");
        idea.questions.forEach((q, i) => lines.push(`${i + 1}. ${q}`));
      }
      lines.push("", `---`, `Criado: ${formatDate(idea.createdAt)} | Atualizado: ${formatDate(idea.updatedAt)}`);
      blob = new Blob([lines.join("\n")], { type: "text/markdown" });
      filename = `${(idea.title || "spark").toLowerCase().replace(/\s+/g, "-")}.md`;
    } else {
      const data = {
        id: idea.id,
        title: idea.title,
        summary: idea.summary,
        rawText: idea.rawText,
        category: idea.category,
        status: idea.status,
        tags: idea.tags,
        suggestedStack: idea.suggestedStack,
        questions: idea.questions,
        createdAt: idea.createdAt,
        updatedAt: idea.updatedAt,
      };
      blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      filename = `${(idea.title || "spark").toLowerCase().replace(/\s+/g, "-")}.json`;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  function formatDateShort(iso) {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "short", year: "numeric",
    });
  }

  function formatTime(date) {
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  const CATEGORY_OPTIONS = [
    { value: "geral", label: "Geral" },
    { value: "projeto", label: "Projetos" },
    { value: "livro", label: "Livros" },
    { value: "design", label: "Design" },
    { value: "estudo", label: "Estudo" },
  ];
</script>

<svelte:window on:click={() => { showStatusMenu = false; showExportMenu = false; }} />

<div class="detail">
  <div class="tech-grid" aria-hidden="true" />
  <div class="scan-line" aria-hidden="true" />

  <!-- HEADER -->
  <div class="detail-header">
    <button class="btn-back" on:click={() => dispatch("close")} type="button">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
      voltar
    </button>

    <div class="header-id">
      <span class="header-id-text">SPARK-{(idea.id || "").slice(0, 6).toUpperCase()}</span>
    </div>

    <div class="header-actions">
      {#if editing}
        <button class="btn-ghost" on:click={cancelEdit} type="button">cancelar</button>
        <button class="btn-primary" on:click={saveEdit} disabled={saving} type="button">
          {saving ? "salvando..." : "salvar"}
        </button>
      {:else}
        <!-- export -->
        <div class="export-wrapper">
          <button class="btn-ghost" on:click|stopPropagation={() => (showExportMenu = !showExportMenu)} type="button">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            exportar
          </button>
          {#if showExportMenu}
            <div class="export-dropdown" on:click|stopPropagation>
              <button class="export-option" on:click={() => exportAs("md")} type="button">
                <span class="export-icon">.md</span> Markdown
              </button>
              <button class="export-option" on:click={() => exportAs("json")} type="button">
                <span class="export-icon">.json</span> JSON
              </button>
            </div>
          {/if}
        </div>

        <button class="btn-ghost" on:click={startEdit} type="button">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          editar
        </button>
        <button class="btn-ghost btn-danger" on:click={handleDelete} type="button">remover</button>

        <button class="btn-ghost btn-refine-toggle" class:active={showRefine} on:click|stopPropagation={() => (showRefine = !showRefine)} type="button">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          refinar
          {#if refineHistory.length > 0}<span class="refine-count">{refineHistory.length}</span>{/if}
        </button>
      {/if}
    </div>
  </div>

  <!-- BODY -->
  <div class="detail-body">
    {#if editing}
      <div class="edit-panel">
        <div class="edit-group">
          <label class="edit-label" for="edit-title">titulo</label>
          <input id="edit-title" class="edit-input title-input" type="text" bind:value={editTitle} placeholder="Titulo da spark" />
        </div>
        <div class="edit-group">
          <label class="edit-label" for="edit-category">categoria</label>
          <div class="edit-category-row">
            {#each CATEGORY_OPTIONS as cat}
              <button class="cat-pill" class:active={editCategory === cat.value} on:click={() => (editCategory = cat.value)} type="button">{cat.label}</button>
            {/each}
          </div>
        </div>
        <div class="edit-group">
          <label class="edit-label" for="edit-summary">resumo</label>
          <textarea id="edit-summary" class="edit-textarea" bind:value={editSummary} rows="3" placeholder="Resumo da ideia..." />
        </div>
        <div class="edit-group">
          <label class="edit-label" for="edit-raw">ideia original</label>
          <textarea id="edit-raw" class="edit-textarea mono" bind:value={editRawText} rows="4" placeholder="Texto original..." />
        </div>
        <div class="edit-row">
          <div class="edit-group flex-1">
            <label class="edit-label" for="edit-tags">tags</label>
            <input id="edit-tags" class="edit-input" type="text" bind:value={editTags} placeholder="separadas por virgula" />
          </div>
          <div class="edit-group flex-1">
            <label class="edit-label" for="edit-stack">stack</label>
            <input id="edit-stack" class="edit-input" type="text" bind:value={editStack} placeholder="separadas por virgula" />
          </div>
        </div>
      </div>
    {:else}
      <div class="doc-layout">
        <!-- SIDEBAR LEFT -->
        <aside class="doc-sidebar">
          <div class="sidebar-block">
            <span class="sidebar-label">status</span>
            <div class="status-wrapper">
              <button class="status-pill" style="background: {statusStyle.bg}; color: {statusStyle.color};" on:click|stopPropagation={() => (showStatusMenu = !showStatusMenu)} type="button">
                <span class="status-dot-sm" style="background: {statusStyle.dot}" />
                {statusLabel}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              {#if showStatusMenu}
                <div class="status-dropdown" on:click|stopPropagation>
                  {#each STATUSES as s}
                    <button class="status-option" class:current={idea.status === s} on:click={() => setStatus(s)} type="button">
                      <span class="status-dot-sm" style="background: {(STATUS_COLORS[s] || STATUS_COLORS.idea).dot}" />
                      {STATUS_LABELS[s] || s}
                    </button>
                  {/each}
                </div>
              {/if}
            </div>
          </div>

          <div class="sidebar-block">
            <span class="sidebar-label">categoria</span>
            <div class="sidebar-category">
              <Icon name={categoryIcon} size={13} />
              <span>{categoryLabel}</span>
            </div>
          </div>

          {#if idea.suggestedStack?.length > 0}
            <div class="sidebar-block">
              <span class="sidebar-label">stack</span>
              <div class="sidebar-tags">
                {#each idea.suggestedStack as tech}
                  <span class="stag stag-tech">{tech}</span>
                {/each}
              </div>
            </div>
          {/if}

          {#if idea.tags?.length > 0}
            <div class="sidebar-block">
              <span class="sidebar-label">tags</span>
              <div class="sidebar-tags">
                {#each idea.tags as tag}
                  <span class="stag stag-topic">{tag}</span>
                {/each}
              </div>
            </div>
          {/if}

          <div class="sidebar-block sidebar-dates">
            <div class="sidebar-date-row">
              <span class="sidebar-date-label">criado</span>
              <span class="sidebar-date-value">{formatDateShort(idea.createdAt)}</span>
            </div>
            <div class="sidebar-date-row">
              <span class="sidebar-date-label">atualizado</span>
              <span class="sidebar-date-value">{formatDateShort(idea.updatedAt)}</span>
            </div>
          </div>
        </aside>

        <!-- MAIN CONTENT RIGHT -->
        <div class="doc-main">
          <div class="doc-title-block">
            <SparkIcon size={24} />
            <h1 class="doc-title">{idea.title}</h1>
          </div>

          {#if idea.summary}
            <p class="doc-summary">{idea.summary}</p>
          {/if}

          <div class="doc-section">
            <div class="doc-section-header">
              <span class="doc-section-rule" />
              <span class="doc-section-label">ideia original</span>
            </div>
            <div class="doc-raw">{idea.rawText}</div>
          </div>

          {#if idea.questions?.length > 0}
            <div class="doc-section">
              <div class="doc-section-header">
                <span class="doc-section-rule" />
                <span class="doc-section-label">perguntas para refinar</span>
              </div>
              <div class="doc-questions">
                {#each idea.questions as question, i}
                  <button class="doc-question" on:click={() => handleQuestionClick(question)} type="button">
                    <span class="doc-question-num">{String(i + 1).padStart(2, "0")}</span>
                    <span class="doc-question-text">{question}</span>
                    <svg class="doc-question-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>

  <!-- REFINE DRAWER (right side, toggled by header button) -->
  {#if !editing && showRefine}
    <button class="refine-scrim" on:click={() => (showRefine = false)} aria-label="Fechar painel de refino" type="button" />
  {/if}
  {#if !editing}
    <aside class="refine-drawer" class:open={showRefine}>
      <div class="refine-drawer-header">
        <span class="refine-drawer-title">refinar</span>
        <button class="refine-drawer-close" on:click={() => (showRefine = false)} type="button" aria-label="Fechar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {#if refineHistory.length > 0}
        <div class="refine-messages">
          {#each refineHistory as msg}
            {#if msg.type === "user"}
              <div class="refine-msg refine-msg-user">
                <p>{msg.text}</p>
                <span class="refine-time">{formatTime(msg.ts)}</span>
              </div>
            {:else if msg.type === "spark"}
              <div class="refine-msg refine-msg-spark">
                <span class="refine-badge">✦ atualizada</span>
                <p class="refine-spark-title">{msg.text}</p>
                {#if msg.summary}
                  <p class="refine-spark-summary">{msg.summary}</p>
                {/if}
                <span class="refine-time">{formatTime(msg.ts)}</span>
              </div>
            {:else}
              <div class="refine-msg refine-msg-system">
                <p>{msg.text}</p>
              </div>
            {/if}
          {/each}
          {#if isRefining}
            <div class="refine-msg refine-msg-system">
              <div class="typing"><span /><span /><span /></div>
              <span class="refine-processing">refinando...</span>
            </div>
          {/if}
        </div>
      {:else}
        <div class="refine-empty">
          <p>faça uma pergunta ou responda uma sugestão pra refinar essa ideia.</p>
        </div>
      {/if}

      <div class="refine-input-row">
        <div class="refine-input-wrap">
          <textarea
            bind:this={refineInputEl}
            bind:value={refineText}
            on:keydown={handleRefineKeydown}
            on:input={autoResizeRefine}
            placeholder="responda uma pergunta ou adicione contexto..."
            disabled={isRefining}
            rows="1"
          />
          <button class="refine-send" on:click={handleRefine} disabled={!refineText.trim() || isRefining} type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <span class="refine-hint">ctrl+enter para enviar</span>
      </div>
    </aside>
  {/if}
</div>

<style>
  .detail { height: 100%; display: flex; flex-direction: column; overflow: hidden; position: relative; }

  .tech-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(139, 92, 246, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(139, 92, 246, 0.03) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: radial-gradient(ellipse 60% 60% at 50% 40%, black 20%, transparent 70%);
    -webkit-mask-image: radial-gradient(ellipse 60% 60% at 50% 40%, black 20%, transparent 70%);
    pointer-events: none;
  }

  .scan-line {
    position: absolute; inset: 0;
    background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(139, 92, 246, 0.008) 3px, rgba(139, 92, 246, 0.008) 4px);
    pointer-events: none;
  }

  /* ── header (flat, minimal — matches Home topbar) ── */
  .detail-header {
    position: relative; z-index: 10;
    display: flex; align-items: center; padding: 12px 24px;
    flex-shrink: 0; gap: 12px;
  }
  .btn-back {
    all: unset; cursor: pointer; display: flex; align-items: center; gap: 5px;
    font-family: var(--font-mono); font-size: 11px; color: var(--text-tertiary);
    padding: 4px 0; transition: color var(--transition-fast);
  }
  .btn-back:hover { color: var(--text-primary); }
  .header-id { flex: 1; display: flex; justify-content: center; }
  .header-id-text { font-family: var(--font-mono); font-size: 10px; letter-spacing: 1.5px; color: var(--text-ghost); }
  .header-actions { display: flex; align-items: center; gap: 6px; }

  .btn-ghost {
    all: unset; cursor: pointer; display: flex; align-items: center; gap: 5px;
    font-family: var(--font-ui); font-size: 11px; color: var(--text-tertiary);
    padding: 5px 10px; border-radius: var(--radius-sm); transition: all var(--transition-fast);
  }
  .btn-ghost:hover { color: var(--text-primary); background: rgba(255, 255, 255, 0.05); }
  .btn-danger:hover { color: #ef4444; }
  .btn-refine-toggle.active { color: var(--text-primary); background: rgba(139, 92, 246, 0.12); }
  .refine-count {
    font-size: 10px; font-family: var(--font-mono); color: var(--purple-200);
    background: rgba(139, 92, 246, 0.18); padding: 1px 6px; border-radius: 10px;
  }

  .btn-primary {
    all: unset; cursor: pointer; font-family: var(--font-display); font-size: 11px; font-weight: 600;
    color: white; background: var(--spark-gradient); padding: 5px 14px; border-radius: var(--radius-sm);
    transition: opacity var(--transition-fast);
  }
  .btn-primary:hover:not(:disabled) { opacity: 0.9; }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ── export dropdown ── */
  .export-wrapper { position: relative; }
  .export-dropdown {
    position: absolute; top: calc(100% + 4px); right: 0; min-width: 140px;
    background: rgba(14, 13, 20, 0.95); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    border: 0.5px solid rgba(255, 255, 255, 0.1); border-radius: var(--radius-md);
    padding: 4px; z-index: 50; box-shadow: 0 12px 32px -4px rgba(0, 0, 0, 0.6);
  }
  .export-option {
    all: unset; cursor: pointer; display: flex; align-items: center; gap: 8px; width: 100%;
    font-family: var(--font-ui); font-size: 11px; color: var(--text-tertiary);
    padding: 7px 10px; border-radius: var(--radius-xs); transition: all var(--transition-fast);
    box-sizing: border-box;
  }
  .export-option:hover { color: var(--text-primary); background: rgba(255, 255, 255, 0.06); }
  .export-icon {
    font-family: var(--font-mono); font-size: 9px; color: var(--purple-300);
    background: rgba(139, 92, 246, 0.12); padding: 2px 5px; border-radius: 2px;
  }

  /* ── body ── */
  .detail-body { position: relative; z-index: 1; flex: 1; overflow-y: auto; min-height: 0; }

  /* ── doc layout ── */
  .doc-layout { display: grid; grid-template-columns: 220px 1fr; min-height: 100%; }

  .doc-main {
    padding: 28px 32px 40px; display: flex; flex-direction: column; gap: 24px;
  }
  .doc-title-block { display: flex; align-items: center; gap: 12px; }
  .doc-title {
    font-family: var(--font-display); font-size: 22px; font-weight: 700;
    color: var(--text-primary); line-height: 1.25; letter-spacing: -0.3px;
  }
  .doc-summary { font-size: 14px; color: var(--text-secondary); line-height: 1.75; max-width: 580px; }

  .doc-section { display: flex; flex-direction: column; gap: 12px; }
  .doc-section-header { display: flex; align-items: center; gap: 10px; }
  .doc-section-rule { width: 16px; height: 1.5px; background: var(--purple-500); border-radius: 1px; flex-shrink: 0; }
  .doc-section-label { font-family: var(--font-mono); font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-muted); }

  .doc-raw {
    font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary);
    background: rgba(10, 9, 16, 0.65); padding: 14px 16px; border-radius: var(--radius-md);
    border-left: 2px solid var(--purple-700); white-space: pre-wrap; line-height: 1.75;
  }

  /* questions - now clickable */
  .doc-questions { display: flex; flex-direction: column; gap: 2px; }
  .doc-question {
    all: unset; cursor: pointer; display: flex; align-items: flex-start; gap: 12px;
    padding: 10px 14px; border-radius: var(--radius-md); transition: background var(--transition-fast);
    width: 100%; box-sizing: border-box;
  }
  .doc-question:hover { background: rgba(139, 92, 246, 0.06); }
  .doc-question:hover .doc-question-arrow { opacity: 1; transform: translateX(2px); }
  .doc-question-num { font-family: var(--font-mono); font-size: 10px; color: var(--purple-400); padding-top: 2px; flex-shrink: 0; font-weight: 600; }
  .doc-question-text { font-size: 13px; color: var(--text-secondary); line-height: 1.6; flex: 1; text-align: left; }
  .doc-question-arrow { opacity: 0; color: var(--purple-400); flex-shrink: 0; transition: all 180ms ease; }

  /* ── refine drawer (right side, toggled from header) ── */
  .refine-scrim {
    all: unset; position: absolute; inset: 0; z-index: 35; cursor: default;
  }

  .refine-drawer {
    position: absolute; top: 0; right: 0; bottom: 0; width: 360px; max-width: 88vw;
    display: flex; flex-direction: column; z-index: 40;
    background: rgba(12, 11, 18, 0.9); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border-left: 0.5px solid rgba(255, 255, 255, 0.08);
    box-shadow: -16px 0 40px -12px rgba(0, 0, 0, 0.55);
    transform: translateX(100%); transition: transform 280ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  .refine-drawer.open { transform: translateX(0); }

  .refine-drawer-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 16px; border-bottom: 0.5px solid rgba(255, 255, 255, 0.06); flex-shrink: 0;
  }
  .refine-drawer-title {
    font-family: var(--font-mono); font-size: 10px; letter-spacing: 1.5px;
    text-transform: uppercase; color: var(--text-muted);
  }
  .refine-drawer-close {
    all: unset; cursor: pointer; width: 22px; height: 22px; display: flex; align-items: center;
    justify-content: center; border-radius: var(--radius-xs); color: var(--text-tertiary);
    transition: all var(--transition-fast);
  }
  .refine-drawer-close:hover { color: var(--text-primary); background: rgba(255, 255, 255, 0.06); }

  .refine-input-row {
    display: flex; flex-direction: column; gap: 6px; padding: 12px 16px 16px; flex-shrink: 0;
    border-top: 0.5px solid rgba(255, 255, 255, 0.06);
  }
  .refine-messages {
    display: flex; flex-direction: column; gap: 8px;
    flex: 1; overflow-y: auto; padding: 12px 16px;
  }
  .refine-empty {
    flex: 1; display: flex; align-items: center; justify-content: center; padding: 24px;
  }
  .refine-empty p {
    margin: 0; text-align: center; font-size: 12px; line-height: 1.6; color: var(--text-ghost);
  }
  .refine-msg { padding: 8px 12px; border-radius: var(--radius-md); font-size: 12px; line-height: 1.6; }
  .refine-msg p { margin: 0; }
  .refine-msg-user {
    background: rgba(139, 92, 246, 0.12); border: 0.5px solid rgba(139, 92, 246, 0.15);
    color: var(--text-primary); align-self: flex-end; max-width: 85%;
  }
  .refine-msg-spark {
    background: rgba(10, 9, 16, 0.5); border: 0.5px solid rgba(255, 255, 255, 0.06);
    color: var(--text-secondary); max-width: 85%; display: flex; flex-direction: column; gap: 4px;
  }
  .refine-msg-system {
    background: rgba(255, 255, 255, 0.02); color: var(--text-muted);
    font-family: var(--font-mono); font-size: 11px; display: flex; align-items: center; gap: 8px;
  }
  .refine-badge { font-family: var(--font-mono); font-size: 10px; color: var(--purple-300); }
  .refine-spark-title { font-weight: 500; color: var(--text-primary); font-size: 12px; }
  .refine-spark-summary { color: var(--text-tertiary); font-size: 11px; }
  .refine-time { font-family: var(--font-mono); font-size: 9px; color: var(--text-ghost); align-self: flex-end; }
  .refine-processing { font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); }

  .typing { display: flex; gap: 3px; }
  .typing span { width: 5px; height: 5px; border-radius: 50%; background: var(--purple-400); animation: bounce 1.2s ease-in-out infinite; }
  .typing span:nth-child(2) { animation-delay: 0.15s; }
  .typing span:nth-child(3) { animation-delay: 0.3s; }
  @keyframes bounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-5px); opacity: 1; } }

  .refine-input-wrap {
    display: flex; gap: 8px; background: rgba(10, 9, 16, 0.5);
    border: 0.5px solid rgba(255, 255, 255, 0.08); border-radius: var(--radius-md);
    padding: 10px 10px 10px 14px; transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  }
  .refine-input-wrap:focus-within { border-color: var(--border-accent); box-shadow: var(--glow-accent); }
  .refine-input-wrap textarea {
    flex: 1; background: transparent; border: none; color: var(--text-primary);
    font-family: var(--font-ui); font-size: 12px; line-height: 1.6; resize: none; outline: none;
    min-height: 36px; max-height: 140px; overflow-y: auto;
  }
  .refine-input-wrap textarea::placeholder { color: var(--text-ghost); }
  .refine-input-wrap textarea:disabled { opacity: 0.5; }

  .refine-send {
    all: unset; width: 28px; height: 28px; border-radius: var(--radius-sm);
    background: var(--spark-gradient); display: flex; align-items: center; justify-content: center;
    color: white; flex-shrink: 0; align-self: flex-end;
    transition: opacity var(--transition-fast), transform var(--transition-fast);
  }
  .refine-send:hover:not(:disabled) { opacity: 0.9; transform: scale(1.04); }
  .refine-send:disabled { opacity: 0.2; cursor: not-allowed; }

  .refine-hint { font-family: var(--font-mono); font-size: 10px; color: var(--text-ghost); }

  /* ── sidebar ── */
  .doc-sidebar {
    padding: 28px 20px; display: flex; flex-direction: column; gap: 20px;
    border-right: 0.5px solid rgba(255, 255, 255, 0.04);
  }
  .sidebar-block { display: flex; flex-direction: column; gap: 8px; }
  .sidebar-label { font-family: var(--font-mono); font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-ghost); }

  .status-wrapper { position: relative; }
  .status-pill {
    all: unset; cursor: pointer; display: flex; align-items: center; gap: 6px;
    font-family: var(--font-ui); font-size: 11px; font-weight: 500;
    padding: 5px 10px; border-radius: var(--radius-sm); transition: all var(--transition-fast);
    width: 100%; box-sizing: border-box;
  }
  .status-pill:hover { filter: brightness(1.15); }
  .status-pill svg { margin-left: auto; opacity: 0.5; }
  .status-dot-sm { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

  .status-dropdown {
    position: absolute; top: calc(100% + 4px); left: 0; right: 0;
    background: rgba(14, 13, 20, 0.95); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    border: 0.5px solid rgba(255, 255, 255, 0.1); border-radius: var(--radius-md);
    padding: 4px; z-index: 50; box-shadow: 0 12px 32px -4px rgba(0, 0, 0, 0.6);
    display: flex; flex-direction: column; gap: 1px;
  }
  .status-option {
    all: unset; cursor: pointer; display: flex; align-items: center; gap: 7px;
    font-family: var(--font-ui); font-size: 11px; color: var(--text-tertiary);
    padding: 6px 10px; border-radius: var(--radius-xs); transition: all var(--transition-fast);
  }
  .status-option:hover { color: var(--text-primary); background: rgba(255, 255, 255, 0.06); }
  .status-option.current { color: var(--text-primary); background: rgba(139, 92, 246, 0.1); }

  .sidebar-category { display: flex; align-items: center; gap: 7px; font-family: var(--font-ui); font-size: 12px; color: var(--text-secondary); }
  .sidebar-tags { display: flex; flex-wrap: wrap; gap: 4px; }
  .stag { font-size: 10px; font-family: var(--font-mono); padding: 3px 8px; border-radius: 3px; }
  .stag-tech { color: var(--pink-200); background: rgba(246, 92, 244, 0.12); }
  .stag-topic { color: var(--purple-200); background: rgba(139, 92, 246, 0.12); }

  .sidebar-dates { margin-top: auto; padding-top: 16px; border-top: 0.5px solid rgba(255, 255, 255, 0.04); gap: 6px; }
  .sidebar-date-row { display: flex; justify-content: space-between; align-items: center; }
  .sidebar-date-label { font-family: var(--font-mono); font-size: 10px; color: var(--text-ghost); }
  .sidebar-date-value { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); }

  /* ── edit mode ── */
  .edit-panel { padding: 28px 32px 40px; display: flex; flex-direction: column; gap: 18px; max-width: 640px; }
  .edit-group { display: flex; flex-direction: column; gap: 6px; }
  .edit-label { font-family: var(--font-mono); font-size: 9px; font-weight: 500; color: var(--text-ghost); text-transform: uppercase; letter-spacing: 1.5px; }
  .edit-input, .edit-textarea {
    background: rgba(10, 9, 16, 0.5); border: 0.5px solid rgba(255, 255, 255, 0.08);
    border-radius: var(--radius-md); padding: 10px 14px; color: var(--text-primary);
    font-family: var(--font-ui); font-size: 13px; line-height: 1.6; outline: none;
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast); resize: vertical;
  }
  .title-input { font-family: var(--font-display); font-size: 18px; font-weight: 600; padding: 12px 14px; }
  .edit-input:focus, .edit-textarea:focus { border-color: var(--border-accent); box-shadow: var(--glow-accent); }
  .edit-textarea.mono { font-family: var(--font-mono); font-size: 12px; }
  .edit-row { display: flex; gap: 14px; }
  .flex-1 { flex: 1; }
  .edit-category-row { display: flex; gap: 6px; flex-wrap: wrap; }
  .cat-pill {
    all: unset; cursor: pointer; font-family: var(--font-ui); font-size: 11px;
    padding: 5px 12px; border-radius: var(--radius-md); border: 0.5px solid var(--border-subtle);
    color: var(--text-tertiary); transition: all var(--transition-fast);
  }
  .cat-pill:hover { color: var(--text-secondary); border-color: var(--glass-border); background: rgba(255, 255, 255, 0.03); }
  .cat-pill.active { color: var(--text-primary); background: rgba(139, 92, 246, 0.12); border-color: rgba(139, 92, 246, 0.25); }
</style>