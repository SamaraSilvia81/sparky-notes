<script>
  import SparkIcon from "./SparkIcon.svelte";
</script>

<div class="empty">
  <SparkIcon size={36} />
  <p class="empty-title">nenhuma spark ainda</p>
  <p class="empty-hint">despeje uma ideia no campo acima e veja a mágica acontecer</p>
</div>

<style>
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 60px 20px;
    text-align: center;
  }

  .empty-title {
    font-family: var(--font-display);
    font-size: 15px;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .empty-hint {
    font-size: 12px;
    color: var(--text-ghost);
    max-width: 240px;
  }
</style>
