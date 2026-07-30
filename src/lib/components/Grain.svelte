<div class="grain" aria-hidden="true">
  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <filter id="sparky-grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#sparky-grain)" opacity="0.08" />
  </svg>
</div>

<style>
  .grain {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 9999;
    mix-blend-mode: overlay;
  }
</style>