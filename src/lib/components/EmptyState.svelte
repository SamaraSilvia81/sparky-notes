<script>
  import logoIcon from "../../assets/logo-icon.png";
</script>

<div class="empty">
  <div class="empty-visual">
    <div class="rings">
      <div class="ring ring-1" />
      <div class="ring ring-2" />
      <div class="ring ring-3" />
    </div>
    <img src={logoIcon} alt="" class="empty-logo" />
  </div>
  <p class="empty-title">nenhuma spark por aqui</p>
  <p class="empty-hint">volte ao início e despeje uma ideia — ela aparece aqui depois de processada</p>
</div>

<style>
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 80px 20px;
    text-align: center;
  }

  .empty-visual {
    position: relative;
    width: 120px;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
  }

  .rings {
    position: absolute;
    inset: 0;
  }

  .ring {
    position: absolute;
    border-radius: 50%;
    border: 0.5px solid;
  }

  .ring-1 {
    inset: 0;
    border-color: rgba(139, 92, 246, 0.08);
    animation: ring-spin 20s linear infinite;
  }

  .ring-2 {
    inset: 12px;
    border-color: rgba(246, 92, 244, 0.06);
    animation: ring-spin 15s linear infinite reverse;
  }

  .ring-3 {
    inset: 24px;
    border-color: rgba(139, 92, 246, 0.04);
    animation: ring-spin 25s linear infinite;
  }

  @keyframes ring-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .ring-1::after,
  .ring-2::after {
    content: "";
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    top: -2px;
    left: 50%;
  }

  .ring-1::after {
    background: rgba(139, 92, 246, 0.3);
  }

  .ring-2::after {
    background: rgba(246, 92, 244, 0.25);
  }

  .empty-logo {
    width: 48px;
    height: 48px;
    object-fit: contain;
    opacity: 0.35;
    filter: grayscale(0.5);
  }

  .empty-title {
    font-family: var(--font-display);
    font-size: 16px;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .empty-hint {
    font-size: 13px;
    color: var(--text-muted);
    max-width: 300px;
    line-height: 1.6;
  }
</style>
