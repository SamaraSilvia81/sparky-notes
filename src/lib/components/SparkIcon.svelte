<script>
  export let size = 20;
  export let glow = false;
</script>

<svg class:glow width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="spark-ray" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8b5cf6" />
      <stop offset="100%" stop-color="#f65cf4" />
    </linearGradient>
  </defs>
  <path d="M24 4C24 4,27 18,24 24C24 24,18 27,4 24C4 24,18 21,24 24C24 24,21 18,24 4Z" fill="white"/>
  <path d="M24 44C24 44,21 30,24 24C24 24,30 21,44 24C44 24,30 27,24 24C24 24,27 30,24 44Z" fill="white"/>
  <line x1="8" y1="8" x2="16" y2="16" stroke="url(#spark-ray)" stroke-width="3" stroke-linecap="round"/>
  <line x1="40" y1="8" x2="32" y2="16" stroke="url(#spark-ray)" stroke-width="3" stroke-linecap="round"/>
  <line x1="8" y1="40" x2="16" y2="32" stroke="url(#spark-ray)" stroke-width="3" stroke-linecap="round"/>
  <line x1="40" y1="40" x2="32" y2="32" stroke="url(#spark-ray)" stroke-width="3" stroke-linecap="round"/>
</svg>

<style>
  svg { flex-shrink: 0; }
  .glow {
    filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.5));
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { filter: drop-shadow(0 0 6px rgba(139, 92, 246, 0.4)); }
    50% { filter: drop-shadow(0 0 14px rgba(246, 92, 244, 0.5)); }
  }
</style>